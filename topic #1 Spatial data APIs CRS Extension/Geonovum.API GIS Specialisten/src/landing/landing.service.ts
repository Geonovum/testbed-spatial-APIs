import { Injectable } from '@nestjs/common';

import { LandingPage } from './interfaces/landing-page.interface';

@Injectable()
export class LandingService {
    getLandingPage(): LandingPage {
        const landingPage: LandingPage = {
            title: process.env.APP_TITLE,
            description: process.env.APP_DESCRIPTION,
            links: [
                { href: '/', rel: 'self', type: 'application/json', title: 'This document' },
                { href: '/api', rel: 'service-doc', type:'text/html', title: 'The API documentation'},
                { href: '/api-json', rel: 'service-doc', type:'application/vnd.oai.openapi+json;version=3.0', title: 'The API documentation in JSON format'},
                { href: '/conformance', rel: 'conformance', type: 'application/json', title: 'OGC API conformance classes implemented by this server'},
                { href: '/collections', rel: 'data', type: 'application/json', title: 'Information about the feature collections' },
            ],
        };

        return landingPage;
    }
}
