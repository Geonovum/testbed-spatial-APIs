import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { LandingPage } from './interfaces/landing-page.interface';
import { LandingService } from './landing.service';

@ApiTags('Landing')
@Controller()
export class LandingController {
    constructor(private readonly landingService: LandingService) {}

    /** Returns the landing page with the available links in this API */
    @Get()
    getLandingPage(): LandingPage {
        return this.landingService.getLandingPage();
    }
}
