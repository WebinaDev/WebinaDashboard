<?php
spl_autoload_register(function ($class) {
    $prefix = 'WncBasalam\\';
    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $base = __DIR__ . '/';
    $file = $base . 'includes/' . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($file)) {
        require $file;
        return;
    }
    // Root-level classes (JobManager, JobsRunner, AsyncBackgroundProcess)
    $file = $base . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});
