import { Config, Router } from "ziggy-js";
import { RouteParams } from "./param";
declare global {
    declare function route(): Router;
    declare function route<T extends keyof RouteParams>(name: T, params?: RouteParams[T], absolute?: boolean, config?: Config): string;
}
declare module "vue" {
    interface ComponentCustomProperties {
        route: (() => Router) & (<T extends keyof RouteParams>(name: T, params?: RouteParams[T], absolute?: boolean, config?: Config) => string);
    }
}
