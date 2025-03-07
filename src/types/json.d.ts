declare module "*.json" {
    const content: {
        version: string;
        [key: string]: any;
    };
    export = content;
} 