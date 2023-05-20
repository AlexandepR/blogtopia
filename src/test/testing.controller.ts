import { Controller, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { TestingService } from "./testing.service";
import { Public } from "../auth/decorators/public.decorator";


@Controller("testing")
export class TestingController{
  constructor(protected testingService: TestingService) {
  }
  @Public()
  @Delete("all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    console.log('TEST-- DELETE');
    await this.testingService.deleteAll()
  }
}