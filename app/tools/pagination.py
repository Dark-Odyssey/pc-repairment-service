from math import ceil
from schemas import PaginationDTO


def count_pagination(offset: int, limit: int, total: int | None) -> PaginationDTO:

    if not total:
        total = 0

    limit = max(limit, 1)
    pages = ceil(total / limit)
    page = (offset // limit) + 1

    return PaginationDTO(
        total=total,
        offset=offset,
        limit=limit,
        page=page,
        pages=pages,
        has_prev=page > 1,
        has_next=page < pages
    )
