premium_read_count = 0;
user_proxy_handler = {
  get(target, prop, receiver) {
    if (prop === "is_premium") {
      premium_read_count++;
      if (premium_read_count === 1) {
        return true;
      }
    }
    return Reflect.get(...arguments);
  },
};

window.sdWindow = new Proxy(
  {},
  {
    set(target, prop, value) {
      if (prop === "user") {
        value = new Proxy(value, user_proxy_handler);
      }
      target[prop] = value;
    },
  }
);
