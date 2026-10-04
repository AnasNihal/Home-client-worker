from PIL import Image, UnidentifiedImageError


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}


def validate_uploaded_image(uploaded_file, max_size):
    """Validate both the declared MIME type and the actual image bytes."""
    if uploaded_file.size > max_size:
        raise ValueError(f"Image must be {max_size // (1024 * 1024)} MB or smaller.")

    expected_format = ALLOWED_IMAGE_TYPES.get(uploaded_file.content_type)
    if not expected_format:
        raise ValueError("Only JPEG, PNG, and WebP images are supported.")

    try:
        uploaded_file.seek(0)
        with Image.open(uploaded_file) as image:
            image.verify()
            if image.format != expected_format:
                raise ValueError("The uploaded file does not match its declared image type.")
    except (UnidentifiedImageError, OSError):
        raise ValueError("The uploaded file is not a valid image.")
    finally:
        uploaded_file.seek(0)
