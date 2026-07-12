<?php
/**
 * Scan includes/ for webino-dashboard gettext strings and merge into languages/*.po.
 *
 * Usage: php scripts/extract-php-i18n.php
 *
 * @package WebinoDashboard
 */

$root      = dirname( __DIR__ );
$includes  = $root . '/includes';
$lang_dir  = $root . '/languages';
$domain    = 'webino-dashboard';
$pot_file  = $lang_dir . '/webino-dashboard.pot';

if ( ! is_dir( $includes ) ) {
	fwrite( STDERR, "includes/ not found\n" );
	exit( 1 );
}

/**
 * @param string $dir Directory.
 * @return array<int,string>
 */
function wd_collect_php_files( $dir ) {
	$files = array();
	$iter  = new RecursiveIteratorIterator(
		new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS )
	);
	foreach ( $iter as $file ) {
		if ( $file->isFile() && 'php' === strtolower( $file->getExtension() ) ) {
			$files[] = $file->getPathname();
		}
	}
	sort( $files );
	return $files;
}

/**
 * @param string $code PHP source.
 * @return array<int,string>
 */
function wd_extract_msgids( $code ) {
	$ids   = array();
	$patterns = array(
		"/__\(\s*'((?:\\\\'|[^'])*)'\s*,\s*'webino-dashboard'\s*\)/",
		'/__\(\s*"((?:\\\\"|[^"])*)"\s*,\s*"webino-dashboard"\s*\)/',
		"/_e\(\s*'((?:\\\\'|[^'])*)'\s*,\s*'webino-dashboard'\s*\)/",
		'/_e\(\s*"((?:\\\\"|[^"])*)"\s*,\s*"webino-dashboard"\s*\)/',
		"/esc_html__\(\s*'((?:\\\\'|[^'])*)'\s*,\s*'webino-dashboard'\s*\)/",
		"/esc_attr__\(\s*'((?:\\\\'|[^'])*)'\s*,\s*'webino-dashboard'\s*\)/",
	);
	foreach ( $patterns as $pattern ) {
		if ( preg_match_all( $pattern, $code, $matches ) ) {
			foreach ( $matches[1] as $raw ) {
				$ids[] = stripcslashes( $raw );
			}
		}
	}
	return $ids;
}

$msgids = array();
foreach ( wd_collect_php_files( $includes ) as $path ) {
	$code = file_get_contents( $path );
	if ( false === $code ) {
		continue;
	}
	foreach ( wd_extract_msgids( $code ) as $id ) {
		if ( '' !== $id ) {
			$msgids[ $id ] = true;
		}
	}
}
$msgids = array_keys( $msgids );
sort( $msgids, SORT_STRING );

if ( ! is_dir( $lang_dir ) ) {
	mkdir( $lang_dir, 0755, true );
}

$pot  = "msgid \"\"\nmsgstr \"\"\n\"Project-Id-Version: Webino Dashboard\\n\"\n\"MIME-Version: 1.0\\n\"\n\"Content-Type: text/plain; charset=UTF-8\\n\"\n\"Content-Transfer-Encoding: 8bit\\n\"\n\n";
foreach ( $msgids as $id ) {
	$pot .= 'msgid ' . wd_po_quote( $id ) . "\nmsgstr \"\"\n\n";
}
file_put_contents( $pot_file, $pot );

/**
 * @param string $text Text.
 * @return string
 */
function wd_po_quote( $text ) {
	$text = str_replace( array( '\\', '"' ), array( '\\\\', '\\"' ), $text );
	$text = str_replace( "\n", "\\n\"\n\"", $text );
	return '"' . $text . '"';
}

/**
 * @param string $path Po path.
 * @return array<string,string>
 */
function wd_read_po( $path ) {
	$map = array();
	if ( ! is_readable( $path ) ) {
		return $map;
	}
	$content = file_get_contents( $path );
	if ( false === $content ) {
		return $map;
	}
	if ( preg_match_all( '/msgid\s+((?:"(?:\\\\.|[^"\\\\])*")+)\s+msgstr\s+((?:"(?:\\\\.|[^"\\\\])*")+)/s', $content, $matches, PREG_SET_ORDER ) ) {
		foreach ( $matches as $m ) {
			$id  = wd_po_unquote( $m[1] );
			$str = wd_po_unquote( $m[2] );
			if ( '' !== $id ) {
				$map[ $id ] = $str;
			}
		}
	}
	return $map;
}

/**
 * @param string $quoted Quoted po string.
 * @return string
 */
function wd_po_unquote( $quoted ) {
	$quoted = trim( $quoted );
	if ( strlen( $quoted ) < 2 || '"' !== $quoted[0] ) {
		return '';
	}
	$inner = substr( $quoted, 1, -1 );
	return stripcslashes( str_replace( array( "\\n\"\n\"", '\\n' ), array( "\n", "\n" ), $inner ) );
}

/**
 * @param string $path Po path.
 * @param array<string,string> $existing Existing translations.
 * @param array<int,string> $ids All msgids.
 * @param string $language Language tag.
 * @return void
 */
function wd_write_po( $path, array $existing, array $ids, $language ) {
	$header = "msgid \"\"\nmsgstr \"\"\n"
		. "\"Project-Id-Version: Webino Dashboard\\n\"\n"
		. "\"Language: {$language}\\n\"\n"
		. "\"MIME-Version: 1.0\\n\"\n"
		. "\"Content-Type: text/plain; charset=UTF-8\\n\"\n"
		. "\"Content-Transfer-Encoding: 8bit\\n\"\n\n";
	$body = '';
	foreach ( $ids as $id ) {
		$str = array_key_exists( $id, $existing ) ? $existing[ $id ] : '';
		if ( 'en_US' === $language && '' === $str ) {
			$str = $id;
		}
		$body .= 'msgid ' . wd_po_quote( $id ) . "\nmsgstr " . wd_po_quote( $str ) . "\n\n";
	}
	file_put_contents( $path, $header . $body );
}

$fa_existing = wd_read_po( $lang_dir . '/webino-dashboard-fa_IR.po' );
$en_existing = wd_read_po( $lang_dir . '/webino-dashboard-en_US.po' );

wd_write_po( $lang_dir . '/webino-dashboard-fa_IR.po', $fa_existing, $msgids, 'fa_IR' );
wd_write_po( $lang_dir . '/webino-dashboard-en_US.po', $en_existing, $msgids, 'en_US' );

echo 'Extracted ' . count( $msgids ) . " msgids into languages/*.po\n";
