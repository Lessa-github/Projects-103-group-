// localStorageDB.js - Helper para simular MongoDB no localStorage com contador persistente

const DB = (collection) => {
  const counterKey = `_${collection}_counter`;

  const getAll = () => JSON.parse(localStorage.getItem(collection)) || [];

  const saveAll = (data) => {
    localStorage.setItem(collection, JSON.stringify(data));
  };

  const getNextId = () => {
    let counter = parseInt(localStorage.getItem(counterKey)) || 0;
    counter++;
    localStorage.setItem(counterKey, counter.toString());
    return counter.toString();
  };

  const insert = (doc) => {
    const data = getAll();
    const newDoc = { ...doc, _id: getNextId() };
    data.push(newDoc);
    saveAll(data);
    return newDoc;
  };

  const find = (filterFn = () => true) => {
    return getAll().filter(filterFn);
  };

  const findOne = (filterFn = () => true) => {
    return getAll().find(filterFn);
  };

  const update = (id, updates) => {
    const data = getAll().map(doc => doc._id === id ? { ...doc, ...updates } : doc);
    saveAll(data);
  };

  const remove = (id) => {
    const data = getAll().filter(doc => doc._id !== id);
    saveAll(data);
  };

  const clear = () => {
    localStorage.removeItem(collection);
  };

  return {
    insert,
    find,
    findOne,
    update,
    remove,
    clear,
    getAll
  };
};

// Exemple:
// const Tasks = DB('tasks');
// Tasks.insert({ title: 'Estudar JS' });
// Tasks.update('1', { completed: true });
