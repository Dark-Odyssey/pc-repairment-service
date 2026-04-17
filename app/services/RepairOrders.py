from typing import Sequence
from hashlib import sha256
from secrets import token_hex
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database.models import RepairOrdersORM
from database.repos import RepairOrdersRepo, UserRepo, DeviceTypeRepo, OrderStatusHistoryRepo
from tools.email import EmailHandler
from core.config import settings
from hashids import Hashids
from schemas import RepairOrdersCreateDTO, RepairOrdersFilterDTO, RepairOrderUpdateDTO, OrderCredsDTO, RepairOrdersPaginationDTO, RepairOrdersUserPaginationDTO
from database.repos import RepairOrdersRepo

class RepairOrdersService:
    
    def __init__(self, session: AsyncSession) -> None:
        self.__hashIds = Hashids(salt=settings.SALT, min_length=8)
        self.__emailHandler = EmailHandler()
        self.__repairOrdersRepo = RepairOrdersRepo(session=session) 
        self.__userRepo = UserRepo(session=session)
        self.__deviceTypeRepo = DeviceTypeRepo(session=session)
        self.__orderStatusHistoryRepo = OrderStatusHistoryRepo(session=session)


    async def create_order(self, worker_id: int, schema: RepairOrdersCreateDTO) -> RepairOrdersORM:
        client_db = await self.__userRepo.select_user_by_id(user_id=schema.client_id)
        if not client_db:
            raise HTTPException(status_code=404, detail="Client doesn't exist!")
        device_type_db = await self.__deviceTypeRepo.select_device_type_by_id(id=schema.device_type_id)
        if not device_type_db:
            raise HTTPException(status_code=404, detail="Device type doesn't exist!")

        token = token_hex(16)
        hashed_token = sha256(token.encode()).hexdigest()
        repair_order_db = await self.__repairOrdersRepo.create_repair_order(schema=schema, worker_id=worker_id, access_code_hash=hashed_token)
        order_number = self.__hashIds.encode(repair_order_db.id)
        repair_order_db.order_number = order_number
        await self.__emailHandler.send_repair_order_creds(user_db=client_db, order_number=order_number, access_code=token)
        await self.__orderStatusHistoryRepo.create_order_status_history(repair_order_id=repair_order_db.id, new_status=repair_order_db.status, changed_by_employee_id=worker_id)
        return repair_order_db


    async def select_repair_orders_filter(self, filters: RepairOrdersFilterDTO) -> RepairOrdersPaginationDTO:
        return await self.__repairOrdersRepo.select_repair_orders_filter(filters=filters)


    async def get_by_repair_order_by_id(self, id: int) -> RepairOrdersORM:
        repair_order_db = await self.__repairOrdersRepo.select_repair_order_by_id(id=id) 
        if not repair_order_db:
            raise HTTPException(status_code=404, detail="Repair order doesn't exist!")
        return repair_order_db
    
    async def remove_order(self, id: int) -> None:
        repair_order_db = await self.__repairOrdersRepo.select_repair_order_by_id(id)
        if not repair_order_db:
            raise HTTPException(status_code=404,  detail="Order not found!")
        await self.__repairOrdersRepo.remove_repair_order(repair_order_db)
    
    async def update_order(self, id: int, worker_id: int, schema: RepairOrderUpdateDTO) -> RepairOrdersORM:
        repair_order_db = await self.__repairOrdersRepo.select_repair_order_by_id(id)
        if not repair_order_db:
            raise HTTPException(status_code=404,  detail="Order not found!")

        if repair_order_db.status != schema.status and repair_order_db.estimated_completion_date != schema.estimated_completion_date:
            await self.__orderStatusHistoryRepo.create_order_status_history(
                repair_order_id=repair_order_db.id,
                changed_by_employee_id=worker_id,
                old_status=repair_order_db.status,
                new_status=schema.status,
                old_estimated_completion_date=repair_order_db.estimated_completion_date,
                new_estimated_completion_date=schema.estimated_completion_date
            )
        elif repair_order_db.status != schema.status:
            await self.__orderStatusHistoryRepo.create_order_status_history(
                repair_order_id=repair_order_db.id,
                changed_by_employee_id=worker_id,
                old_status=repair_order_db.status,
                new_status=schema.status
            )
        elif repair_order_db.estimated_completion_date != schema.estimated_completion_date:
            await self.__orderStatusHistoryRepo.create_order_status_history(
                repair_order_id=repair_order_db.id,
                changed_by_employee_id=worker_id,
                old_estimated_completion_date=repair_order_db.estimated_completion_date,
                new_estimated_completion_date=schema.estimated_completion_date
            )

        return await self.__repairOrdersRepo.update_repair_order(repair_order_db=repair_order_db, schema=schema, worker_id=worker_id)


    async def get_order_data_from_creds(self, order_creds: OrderCredsDTO) -> RepairOrdersORM:
        order_id, = self.__hashIds.decode(order_creds.order_number) # type: ignore
        repair_order_db = await self.__repairOrdersRepo.select_repair_order_by_id(order_id)
        if not repair_order_db:
            raise HTTPException(status_code=400, detail="Indalid creds!1")
        hashed_token = sha256(order_creds.access_code.encode()).hexdigest()
        if hashed_token != repair_order_db.access_code_hash:
            raise HTTPException(status_code=400, detail="Indalid creds!")
        return repair_order_db
    

    async def get_user_repair_orders(self, id: int, offset: int, limit: int) -> RepairOrdersUserPaginationDTO:
        return await self.__repairOrdersRepo.select_repair_orders_by_client_id(id=id, offset=offset, limit=limit)