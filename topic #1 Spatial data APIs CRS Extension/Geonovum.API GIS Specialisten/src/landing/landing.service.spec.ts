import { Test, TestingModule } from '@nestjs/testing';

import { LandingService } from './landing.service';

describe('LandingService', () => {
    let service: LandingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LandingService],
        }).compile();

        service = module.get<LandingService>(LandingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
