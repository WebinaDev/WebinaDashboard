<?php

namespace WebinoBasalam\Jobs\Types;

use WebinoBasalam\Jobs\AbstractJobType;
use WebinoBasalam\Jobs\JobResult;
use WebinoBasalam\Jobs\Exceptions\RetryableException;
use WebinoBasalam\Jobs\Exceptions\NonRetryableException;
use WebinoBasalam\Logger\Logger;

defined('ABSPATH') || exit;

class AutoConnectProductsJob extends AbstractJobType
{
    private $autoConnect;

    public function __construct($jobManager,$autoConnect)
    {
        parent::__construct($jobManager);
        $this->autoConnect = $autoConnect;
    }

    public function getType(): string
    {
        return 'sync_basalam_auto_connect_products';
    }

    public function getPriority(): int
    {
        return 6;
    }

    public function execute(array $payload): JobResult
    {
        $cursor = $payload['cursor'] ?? null;
        $thenUpdate = !empty($payload['then_update']);

        try {
            $result = $this->autoConnect->checkSameProduct(null, $cursor);

            if (!is_array($result)) {
                throw new NonRetryableException('پاسخ نامعتبر از اتصال خودکار محصولات');
            }

            if (!empty($result['error'])) {
                $message = isset($result['message']) ? (string) $result['message'] : 'خطا در اتصال خودکار محصولات';
                // Soft "no match" on a page should still complete with stats, not vanish as opaque failure.
                if (isset($result['status_code']) && (int) $result['status_code'] === 404) {
                    return $this->success([
                        'cursor'  => $cursor,
                        'matched' => (int) ($result['matched'] ?? 0),
                        'skipped' => (int) ($result['skipped'] ?? 0),
                        'message' => $message,
                    ]);
                }
                throw new NonRetryableException($message);
            }

            if (!empty($result['has_more']) && !empty($result['next_cursor'])) {
                $nextPayload = ['cursor' => $result['next_cursor']];
                if ($thenUpdate) {
                    $nextPayload['then_update'] = true;
                }
                $this->jobManager->createJob(
                    'sync_basalam_auto_connect_products',
                    'pending',
                    json_encode($nextPayload)
                );
            } elseif ($thenUpdate) {
                $this->jobManager->createJob(
                    'sync_basalam_update_all_products',
                    'pending',
                    null
                );
            }

            return $this->success([
                'cursor'     => $cursor,
                'processed'  => true,
                'matched'    => (int) ($result['matched'] ?? 0),
                'skipped'    => (int) ($result['skipped'] ?? 0),
                'has_more'   => !empty($result['has_more']),
                'message'    => isset($result['message']) ? (string) $result['message'] : '',
            ]);
        } catch (RetryableException $e) {
            Logger::error("خطا در اتصال خودکار محصولات: " . $e->getMessage(), [
                'operation' => 'اتصال خودکار محصولات',
            ]);
            throw $e;
        } catch (NonRetryableException $e) {
            Logger::error("خطا در اتصال خودکار محصولات: " . $e->getMessage(), [
                'operation' => 'اتصال خودکار محصولات',
            ]);
            throw $e;
        }
         catch (\Exception $e) {
            Logger::error("خطا در اتصال خودکار محصولات: " . $e->getMessage(), [
                'operation' => 'اتصال خودکار محصولات',
            ]);
            throw $e;
        }
    }
}
