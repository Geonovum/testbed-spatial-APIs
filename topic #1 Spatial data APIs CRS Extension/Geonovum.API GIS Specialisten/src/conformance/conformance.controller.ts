import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConformanceService } from './conformance.service';
import { Conformance } from './interfaces/conformance.interface';

@ApiTags('Conformance')
@Controller('conformance')
export class ConformanceController {
    constructor(private readonly conformanceService: ConformanceService) {}

    /** Returns the comformance classes this api implements and conforms to */
    @Get()
    getConformance(): Conformance {
        return this.conformanceService.getConformance();
    }
}
