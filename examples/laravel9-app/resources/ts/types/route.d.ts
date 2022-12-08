import { Config, Router } from "ziggy-js";
import { RouteParams } from "./param";
type CustomRouter<T> = Router & {
    get params(): RouteParams[T];
};
declare global {
    declare function route<T extends keyof RouteParams>(): CustomRouter<T>;
    declare function route<T extends keyof RouteParams>(
        name: T,
        params?: RouteParams[T],
        absolute?: boolean,
        config?: Config
    ): string;
}
declare module "vue" {
    interface ComponentCustomProperties {
        route: (<T extends keyof RouteParams>() => CustomRouter<T>) &
            (<T extends keyof RouteParams>(
                name: T,
                params?: RouteParams[T],
                absolute?: boolean,
                config?: Config
            ) => string);
    }
}
