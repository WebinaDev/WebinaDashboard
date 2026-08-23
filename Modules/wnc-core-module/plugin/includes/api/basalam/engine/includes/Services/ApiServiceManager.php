<?php

namespace WncBasalam\Services;

use WncBasalam\Services\Api\PostApiService;
use WncBasalam\Services\Api\GetApiService;
use WncBasalam\Services\Api\PatchApiService;
use WncBasalam\Services\Api\PutApiService;
use WncBasalam\Services\Api\DeleteApiService;
use WncBasalam\Services\Api\FileUploadApiService;

defined('ABSPATH') || exit;

class ApiServiceManager
{
    private $postService = null;
    private $getService = null;
    private $patchService = null;
    private $putService = null;
    private $deleteService = null;
    private $fileUploadService = null;

    public function post($url, $data, $headers = [])
    {
        if ($this->postService === null) $this->postService = new PostApiService();
        return $this->postService->send($url, $data, $headers);
    }

    public function get($url, $headers = [])
    {
        if ($this->getService === null) $this->getService = new GetApiService();
        return $this->getService->send($url, $headers);
    }

    public function patch($url, $data, $headers = [])
    {
        if ($this->patchService === null) $this->patchService = new PatchApiService();
        return $this->patchService->send($url, $data, $headers);
    }

    public function put($url, $data, $headers = [])
    {
        if ($this->putService === null) $this->putService = new PutApiService();
        return $this->putService->send($url, $data, $headers);
    }

    public function delete($url, $headers = [], $data = null)
    {
        if ($this->deleteService === null) $this->deleteService = new DeleteApiService();
        return $this->deleteService->send($url, $headers, (array) $data);
    }

    public function upload($url, $localFile, $data = [], $headers = [], $options = [])
    {
        if ($this->fileUploadService === null) $this->fileUploadService = new FileUploadApiService();
        return $this->fileUploadService->upload($url, $localFile, $data, $headers, $options);
    }
}
