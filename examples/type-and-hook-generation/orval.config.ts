import { defineConfig } from 'orval';
import { ReactApiDataOrvalClient, pascal } from 'react-api-data/lib/orval';

export default defineConfig({
    articles: {
        output: {
            target: './src/generated/apiData.ts',
            schemas: './src/generated/types/',
            client: ReactApiDataOrvalClient(),
            override: {
                /** generate the name of the endpoints based on the route and the method
                 * @param route has an example value of '/api/v1/instrument/graph/${masterinstrumentid}/${period}'
                 * @param method has an value 'get' | 'post' etc.
                 * @example output endpoint 'getInstrumentGraph' with hook 'useGetInstrumentGraph'
                 */
                operationName: (_operation: unknown, route: string, method: string) =>
                    `${method}${pascal(route
                        .replace('/api/v1', '')
                        .replace(/\$\{([^}]+)\}/g, '')
                        .replace('/', '-'))}`,
            },
        },
        input: {
            target: `./openapi.json`,
        },
    },
});
