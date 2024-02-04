export type RouteParams = {
    "password.confirm": {};
    "dashboard": {};
    "verification.send": {};
    "password.request": {};
    "password.email": {};
    "login": {};
    "logout": {};
    "password.update": {};
    "posts.index": {};
    "posts.store": {};
    "posts.create": {};
    "posts.show": {
        post: string;
    };
    "posts.update": {
        post: string;
    };
    "posts.destroy": {
        post: string;
    };
    "posts.edit": {
        post: string;
    };
    "profile.edit": {};
    "profile.update": {};
    "profile.destroy": {};
    "register": {};
    "password.store": {};
    "password.reset": {
        token: string;
    };
    "verification.notice": {};
    "verification.verify": {
        id: string;
        hash: string;
    };
};
