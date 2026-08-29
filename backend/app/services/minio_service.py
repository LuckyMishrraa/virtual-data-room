import io
import logging
from datetime import timedelta

import urllib3
from minio import Minio

from app.config import settings

logger = logging.getLogger(__name__)

class MinioService:
    def __init__(self):
        self._client: Minio | None = None
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._memory_storage: dict[str, bytes] = {} # In-memory buffer fallback
        self._initialize_client()

    def _initialize_client(self):
        try:
            # Fast timeout pool so offline/local tests never hang
            http_client = urllib3.PoolManager(
                timeout=urllib3.Timeout(connect=0.5, read=1.0),
                retries=urllib3.Retry(total=0, connect=0, read=0)
            )
            self._client = Minio(
                endpoint=settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE,
                http_client=http_client
            )
        except Exception as e:
            logger.warning(f"MinIO client init skipped ({e}). Using in-memory buffer.")
            self._client = None

    def ensure_bucket_exists(self):
        """Creates the default VDR bucket if MinIO is reachable."""
        if not self._client:
            return
        try:
            if not self._client.bucket_exists(self.bucket_name):
                self._client.make_bucket(self.bucket_name)
                logger.info(f"Created MinIO bucket: {self.bucket_name}")
        except Exception:
            # MinIO not reachable, disable client for this process session
            self._client = None

    def upload_file(self, object_name: str, data: bytes, content_type: str) -> str:
        """Uploads a byte stream to MinIO with fast memory fallback."""
        if self._client:
            try:
                self.ensure_bucket_exists()
                if self._client:
                    data_stream = io.BytesIO(data)
                    self._client.put_object(
                        bucket_name=self.bucket_name,
                        object_name=object_name,
                        data=data_stream,
                        length=len(data),
                        content_type=content_type or "application/octet-stream"
                    )
                    return object_name
            except Exception as e:
                logger.info(f"MinIO storage skipped, saving to memory buffer: {e}")
                self._client = None

        self._memory_storage[object_name] = data
        return object_name

    def get_file_stream(self, object_name: str):
        """Returns a readable byte stream from MinIO or fallback memory."""
        if self._client:
            try:
                return self._client.get_object(self.bucket_name, object_name)
            except Exception:
                self._client = None

        if object_name in self._memory_storage:
            return io.BytesIO(self._memory_storage[object_name])
        return None

    def get_file_bytes(self, object_name: str) -> bytes | None:
        if object_name in self._memory_storage:
            return self._memory_storage[object_name]

        if self._client:
            try:
                response = self._client.get_object(self.bucket_name, object_name)
                data = response.read()
                response.close()
                response.release_conn()
                return data
            except Exception:
                self._client = None
        return None

    def get_presigned_url(self, object_name: str, filename: str | None = None, expires_seconds: int = 3600) -> str:
        if self._client:
            try:
                url = self._client.presigned_get_object(
                    bucket_name=self.bucket_name,
                    object_name=object_name,
                    expires=timedelta(seconds=expires_seconds),
                    response_headers={"response-content-disposition": f'attachment; filename="{filename or object_name}"'}
                )
                return url.replace("minio:9000", "localhost:9000")
            except Exception:
                self._client = None

        return f"http://localhost:8000/api/v1/files/{object_name}/content?download=true"

    def delete_file(self, object_name: str) -> bool:
        deleted = False
        if object_name in self._memory_storage:
            del self._memory_storage[object_name]
            deleted = True

        if self._client:
            try:
                self._client.remove_object(self.bucket_name, object_name)
                deleted = True
            except Exception:
                self._client = None
        return deleted

minio_service = MinioService()
