import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    ping(): string {
        return `ping! ${new Date().toLocaleString('nl-NL')}`;
    }
}
