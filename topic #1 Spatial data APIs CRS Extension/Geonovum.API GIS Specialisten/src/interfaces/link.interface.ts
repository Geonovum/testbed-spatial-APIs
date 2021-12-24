import { ApiProperty } from '@nestjs/swagger';

export class Link {
    /** relative url */
    href: string;

    /** relation/relates to */
    rel: string;

    @ApiProperty({ description: 'response type', type: String })
    type: 'application/json' | 'text/html' | 'application/xml' | 'application/geo+json' | 'application/vnd.oai.openapi+json;version=3.0';

    title: string;
}
