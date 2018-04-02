
var sql = null;

/*
CREATE TABLE device(
  id INT NOT NULL,
  name VARCHAR(20),
  
  CONSTRAINT device_pk PRIMARY KEY (id)
  );
*/

export function setPool(pool) {
  sql = pool;
}

export function create(id, callback) {
  let prm = new Promise((res, rej) => {
    sql.query();
  });
  
  if (callback) {
    prm.then(callback);
    
  } else {
    return prm;
  }
}

export function get(id, callback) {
  let prm = new Promise((res, rej) => {
    
  });
  
  if (callback) {
    prm.then(callback);
    
  } else {
    return prm;
  }
}

export function update(id, name, ports, indices, tune, callback) {
  let prm = new Promise((res, rej) => {
    
  });
  
  if (callback) {
    prm.then(callback);
    
  } else {
    return prm;
  }
}

export function list(callback) {
  
}

export function remove(id, callback) {
  let prm = new Promise((res, rej) => {
    
  });
  
  if (callback) {
    prm.then(callback);
    
  } else {
    return prm;
  }
}
