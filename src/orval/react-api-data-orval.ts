import { GeneratorDependency, GeneratorImport, GeneratorOptions, GeneratorVerbOptions } from 'orval';
import { camel } from './case';

export const generateVerbImports = ({ response, body, queryParams, params }: GeneratorVerbOptions): GeneratorImport[] => [
    ...response.imports,
    ...body.imports,
    ...(queryParams ? [{ name: queryParams.schema.name }] : []), 
    ...params.flatMap<GeneratorImport>(({ imports }) => imports),
];

const generateReactApiDataHook = (
    {
        verb,
        operationName,
        params,
        response,
        body,
    }: GeneratorVerbOptions,
    { pathRoute }: GeneratorOptions,
) => {
    const errorType = `${response.definition.errors || 'unknown'}`;
    const pathParams =
        pathRoute.match(/\{([^}]+)\}/g)?.reduce<Record<string, string>>((acc, part) => {
            acc[part.replace(/[_{}]/g, '')] = camel(part);
            return acc;
        }, {}) ?? {};

    const hasParams = params?.length > 0;
    const isPartialAllowed = verb !== 'get';

    const paramType = `{${params
                  .map(({ implementation }) => {
                      const parts = implementation.split(':');
                      const first = parts.shift();
                      return `${pathParams[first ?? ''] ?? first}:${parts.join(':')}`;
                  })
                  .join(', ')}}`;

    const hookParamType = hasParams && isPartialAllowed ? `Partial<${paramType}>` : paramType;
    return `export const ${camel(`use-${operationName}`)} = (\n    params: ${hookParamType}${isPartialAllowed ? ' = {}' : ''}, options?: HookOptions \n) => useApiData<${
        response.definition.success || 'unknown'
    }, ${errorType}, ${hookParamType}, ${body.definition.length > 0 ? body.definition : 'unknown'}>('${operationName}', params, options);\n`;
};

export const ReactApiDataOrvalClient = () => {
    const endpoints: Array<{ verbOptions: GeneratorVerbOptions; options: GeneratorOptions }> = [];

    const getReactApiDataDependencies = (): GeneratorDependency[] => [
        {
            exports: [{ name: 'useApiData', values: true }, { name: 'Binding' }, { name: 'HookOptions' }, { name: 'Method' }],
            dependency: 'react-api-data',
        },
    ];
    
    const generateReactApiDataTitle = () => '';

    const generateReactApiDataHeader = () => '';

    const generateReactApiDataFooter = () => `const getUrl = (path: string) => \`\${path}\`;\nexport const endpointConfig = {${endpoints
        .map(
            ({ verbOptions: { operationName, verb }, options: { pathRoute } }) => `
    ${operationName}: {
        url: getUrl('${pathRoute.replace(/\{([^}]+)\}/g, (fullMatch, part) => `:${camel(part)}`)}'),
        method: '${verb.toUpperCase()}' as Method,
    }`
        )
        .join(',')},
};
`;

    const generateReactApiData = (verbOptions: GeneratorVerbOptions, options: GeneratorOptions) => {
        const imports = generateVerbImports(verbOptions);
        const implementation = generateReactApiDataHook(verbOptions, options);
        endpoints.push({ verbOptions, options });

        return {
            implementation,
            imports,
        };
    };

    return () => ({
        client: generateReactApiData,
        header: generateReactApiDataHeader,
        dependencies: getReactApiDataDependencies,
        footer: generateReactApiDataFooter,
        title: generateReactApiDataTitle,
    });
};