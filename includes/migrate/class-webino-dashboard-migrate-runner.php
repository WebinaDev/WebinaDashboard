<?php
/**
 * Pure migration state transitions (resume, retry, rate limit).
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reduces a job state with one batch or complete result. No I/O.
 */
final class Webino_Dashboard_Migrate_Runner {

	const MAX_RETRIES = 3;

	/**
	 * @param string        $job_id   Job id.
	 * @param list<string>  $entities Selected entities in order.
	 * @param int|null      $now      Unix time.
	 * @param bool          $dry_run  Dry run flag copied onto the job.
	 * @return array<string,mixed>
	 */
	public static function initial_state( $job_id, array $entities, $now = null, $dry_run = false ) {
		$now      = null === $now ? time() : (int) $now;
		$progress = array();
		$cursors  = array();
		$retries  = array();
		foreach ( $entities as $entity ) {
			$progress[ $entity ] = array(
				'exported' => 0,
				'failed'   => 0,
				'done'     => false,
			);
			$cursors[ $entity ] = '';
			$retries[ $entity ] = 0;
		}
		$state = array(
			'id'           => (string) $job_id,
			'status'       => 'running',
			'phase'        => 'export',
			'entities'     => array_values( $entities ),
			'entity_index' => 0,
			'cursors'      => $cursors,
			'totals'       => array(),
			'progress'     => $progress,
			'retries'      => $retries,
			'pause_until'  => 0,
			'log'          => array(),
			'last_error'   => '',
			'started_at'       => gmdate( 'c', $now ),
			'updated_at'       => gmdate( 'c', $now ),
			'finished_at'      => null,
			'dry_run'          => (bool) $dry_run,
			'remote_job_id'    => 0,
			'pinged'           => false,
			'remote_resources' => array(),
			'complete_tries'   => 0,
		);
		$state['log'] = Webino_Dashboard_Migrate_Schema::append_log(
			$state['log'],
			'info',
			$dry_run ? 'مهاجرت آزمایشی (بدون ارسال) شروع شد.' : 'مهاجرت شروع شد.',
			$now
		);
		return $state;
	}

	/**
	 * @param array<string,mixed> $state Job.
	 * @param array<string,mixed> $event Result of one push.
	 * @return array<string,mixed>
	 */
	public static function reduce( array $state, array $event ) {
		$now                 = isset( $event['now'] ) ? (int) $event['now'] : time();
		$state['updated_at'] = gmdate( 'c', $now );
		$kind                = isset( $event['kind'] ) ? (string) $event['kind'] : 'batch';
		if ( 'complete' === $kind ) {
			return self::reduce_complete( $state, $event, $now );
		}

		$entity = isset( $event['entity'] ) ? (string) $event['entity'] : '';
		if ( '' === $entity ) {
			return $state;
		}
		if ( ! isset( $state['progress'][ $entity ] ) || ! is_array( $state['progress'][ $entity ] ) ) {
			$state['progress'][ $entity ] = array(
				'exported' => 0,
				'failed'   => 0,
				'done'     => false,
			);
		}

		$ok     = ! empty( $event['ok'] );
		$status = isset( $event['http_status'] ) ? (int) $event['http_status'] : 0;
		if ( ! empty( $event['unsupported'] ) ) {
			$state['progress'][ $entity ]['done']            = true;
			$state['progress'][ $entity ]['skipped_remote']  = true;
			$state['progress'][ $entity ]['unsupported']     = true;
			$state['entity_index']                           = (int) $state['entity_index'] + 1;
			$state['pause_until']                            = 0;
			$state['last_error']                             = '';
			$state['log']                                    = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'warn',
				isset( $event['warning'] ) && '' !== (string) $event['warning']
					? (string) $event['warning']
					: sprintf( 'منبع «%s» در این وبینو پذیرفته نشد. بقیه مهاجرت ادامه پیدا می‌کند.', self::label( $entity ) ),
				$now
			);
			if ( (int) $state['entity_index'] >= count( (array) $state['entities'] ) ) {
				$state['phase'] = 'complete';
			}
			return $state;
		}
		if ( $ok ) {
			$count = isset( $event['exported'] ) ? (int) $event['exported'] : 0;
			$state['progress'][ $entity ]['exported'] += $count;
			$state['retries'][ $entity ]               = 0;
			if ( array_key_exists( 'next_cursor', $event ) ) {
				$state['cursors'][ $entity ] = (string) $event['next_cursor'];
			}
			$state['pause_until'] = 0;
			$state['last_error']  = '';
			if ( ! empty( $event['warning'] ) ) {
				$state['log'] = Webino_Dashboard_Migrate_Schema::append_log( $state['log'], 'warn', (string) $event['warning'], $now );
			}
			if ( ! empty( $event['done'] ) ) {
				$state['progress'][ $entity ]['done'] = true;
				$state['entity_index']                = (int) $state['entity_index'] + 1;
				$state['log']                         = Webino_Dashboard_Migrate_Schema::append_log(
					$state['log'],
					'info',
					sprintf(
						'موجودیت «%1$s» تمام شد. ارسال‌شده: %2$d',
						self::label( $entity ),
						(int) $state['progress'][ $entity ]['exported']
					),
					$now
				);
				if ( (int) $state['entity_index'] >= count( (array) $state['entities'] ) ) {
					$state['phase'] = 'complete';
				}
			} else {
				$state['log'] = Webino_Dashboard_Migrate_Schema::append_log(
					$state['log'],
					'info',
					sprintf( 'دسته %1$s ارسال شد (%2$d مورد).', self::label( $entity ), $count ),
					$now
				);
			}
			return $state;
		}

		$error = isset( $event['error'] ) ? (string) $event['error'] : 'unknown error';
		$error = Webino_Dashboard_Migrate_Schema::redact( $error );
		if ( 429 === $status ) {
			$wait = isset( $event['retry_after'] ) ? (int) $event['retry_after'] : 0;
			if ( $wait <= 0 ) {
				$wait = 15;
			}
			$wait                   = max( 1, min( 300, $wait ) );
			$state['pause_until']   = $now + $wait;
			$state['log']           = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'warn',
				sprintf( 'محدودیت نرخ برای %1$s. ادامه پس از %2$d ثانیه. مکان‌نما تغییر نکرد.', self::label( $entity ), $wait ),
				$now
			);
			return $state;
		}

		if ( $status >= 400 && $status < 500 ) {
			$state['progress'][ $entity ]['failed']++;
			$state['status']      = 'failed';
			$state['last_error']  = $error;
			$state['finished_at'] = gmdate( 'c', $now );
			$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'error',
				sprintf( 'خطای %1$d در %2$s: %3$s', $status, self::label( $entity ), $error ),
				$now
			);
			return $state;
		}

		$retries = isset( $state['retries'][ $entity ] ) ? (int) $state['retries'][ $entity ] : 0;
		++$retries;
		$state['retries'][ $entity ] = $retries;
		if ( $retries >= self::MAX_RETRIES ) {
			$state['progress'][ $entity ]['failed']++;
			$state['status']      = 'failed';
			$state['last_error']  = $error;
			$state['finished_at'] = gmdate( 'c', $now );
			$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'error',
				sprintf( 'پس از %1$d تلاش، %2$s متوقف شد: %3$s', $retries, self::label( $entity ), $error ),
				$now
			);
			return $state;
		}

		$backoff              = min( 60, (int) pow( 2, $retries ) );
		$state['pause_until'] = $now + $backoff;
		$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
			$state['log'],
			'warn',
			sprintf(
				'خطای موقت در %1$s (تلاش %2$d از %3$d). مکان‌نما حفظ شد. %4$s',
				self::label( $entity ),
				$retries,
				self::MAX_RETRIES,
				$error
			),
			$now
		);
		return $state;
	}

	/**
	 * @param array<string,mixed> $state State.
	 * @param array<string,mixed> $event Event.
	 * @param int                 $now   Now.
	 * @return array<string,mixed>
	 */
	private static function reduce_complete( array $state, array $event, $now ) {
		if ( ! empty( $event['pending'] ) ) {
			$tries = isset( $state['complete_tries'] ) ? (int) $state['complete_tries'] : 0;
			++$tries;
			$state['complete_tries'] = $tries;
			$state['phase']          = 'complete';
			$state['status']         = 'running';
			if ( $tries >= 40 ) {
				$state['status']      = 'completed';
				$state['finished_at'] = gmdate( 'c', $now );
				$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
					$state['log'],
					'warn',
					'اعمال دسته‌ها در وبینو پس از چند بار اجرا هنوز تمام نشده است. از صفحه وارد کردن وبینو ادامه دهید.',
					$now
				);
				return $state;
			}
			$state['log'] = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'info',
				'دسته‌ها در صف وبینو هستند. اجرای بعدی ادامه اعمال است.',
				$now
			);
			return $state;
		}
		if ( ! empty( $event['ok'] ) ) {
			$state['status']      = 'completed';
			$state['phase']       = 'complete';
			$state['pause_until'] = 0;
			$state['last_error']  = '';
			$state['finished_at'] = gmdate( 'c', $now );
			$state['retries']['_complete'] = 0;
			$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'info',
				! empty( $state['dry_run'] ) ? 'پیش‌نمایش تمام شد. چیزی به وبینو ارسال نشد.' : 'مهاجرت کامل شد و پایان کار به وبینو اعلام شد.',
				$now
			);
			return $state;
		}

		$event['entity'] = '_complete';
		$error           = isset( $event['error'] ) ? (string) $event['error'] : 'complete failed';
		$status          = isset( $event['http_status'] ) ? (int) $event['http_status'] : 0;
		if ( 429 === $status ) {
			$wait = isset( $event['retry_after'] ) ? (int) $event['retry_after'] : 15;
			$wait = max( 1, min( 300, $wait ) );
			$state['pause_until'] = $now + $wait;
			$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'warn',
				sprintf( 'محدودیت نرخ هنگام اعلام پایان. ادامه پس از %d ثانیه.', $wait ),
				$now
			);
			return $state;
		}
		$retries = isset( $state['retries']['_complete'] ) ? (int) $state['retries']['_complete'] : 0;
		++$retries;
		$state['retries']['_complete'] = $retries;
		if ( ( $status >= 400 && $status < 500 ) || $retries >= self::MAX_RETRIES ) {
			$state['status']      = 'failed';
			$state['last_error']  = Webino_Dashboard_Migrate_Schema::redact( $error );
			$state['finished_at'] = gmdate( 'c', $now );
			$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
				$state['log'],
				'error',
				'اعلام پایان مهاجرت ناموفق بود: ' . Webino_Dashboard_Migrate_Schema::redact( $error ),
				$now
			);
			return $state;
		}
		$state['pause_until'] = $now + min( 60, (int) pow( 2, $retries ) );
		$state['log']         = Webino_Dashboard_Migrate_Schema::append_log(
			$state['log'],
			'warn',
			'خطای موقت هنگام اعلام پایان. داده‌های ارسال‌شده حفظ شده‌اند.',
			$now
		);
		return $state;
	}

	/**
	 * @param string $entity Entity key.
	 * @return string
	 */
	private static function label( $entity ) {
		$labels = Webino_Dashboard_Migrate_Schema::entity_labels();
		return isset( $labels[ $entity ] ) ? $labels[ $entity ] : $entity;
	}
}
