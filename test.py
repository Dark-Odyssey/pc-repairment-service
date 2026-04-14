from math import ceil
# from schemas import PaginationDTO


from pydantic import BaseModel
class PaginationDTO(BaseModel):
    total: int
    offset: int
    limit: int
    page: int
    pages: int
    has_next: int
    has_prev: int

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



print(count_pagination(offset=5, limit=10, total=0))