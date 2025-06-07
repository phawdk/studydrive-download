export const executeExploitPreventionBypass = () => {
  const UserProxyHandler: ProxyHandler<Object> = {
    get(target, prop, receiver) {
      if (prop === "is_premium") {
        return true;
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  (window as any).sdWindow = new Proxy(
    {},
    {
      set(target, prop: string, value: any, receiver: any) {
        if (prop === "user") {
          if (value && typeof value === "object") {
            value = new Proxy(value, UserProxyHandler);
          } else {
            console.warn(
              "[SD-Download]: Non-object value assigned to user property: %o%c\nIf everything works as expected this can safely be ignored.",
              value,
              "color:grey;font-style:italic;"
            );
          }
        }
        return Reflect.set(target, prop, value, receiver);
      },
    }
  );
};
