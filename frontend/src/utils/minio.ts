export function getPublicMinioUrl(url: string) {
    return url.replace('http://minio:9000', '/minio');
}