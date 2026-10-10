import pytest
from tools.worker_tag_patch import patch

def test_scoped_patch_and_rejects_drift():
    source=b'prefix /git/ref/heads/ middle /git/refs/heads/ suffix'
    assert patch(source)==b'prefix /git/ref/tags/ middle /git/refs/tags/ suffix'
    for bad in (source+source, b'missing', patch(source)):
        with pytest.raises(ValueError):
            patch(bad)
