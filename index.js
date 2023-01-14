async function getTableValue(_url) {
  try {
    const result = await fetch(_url, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
    return await result.json();
  } catch (e) {
    console.error(`Error on fetching result for "${_url}"`);
    return null;
  }
}

function createNodeWithTextContent(tagName, content = null) {
  const node = document.createElement(tagName);
  if (content != null)
    node.textContent =
      typeof content === 'object' ? JSON.stringify(content) : content;
  return node;
}

function clearExistingData(tableId) {
  const table = document.getElementById(tableId),
    parent = table.parentNode,
    newTable = document.createElement('table');

  table.remove();

  newTable.id = tableId;
  parent.append(newTable);
}

const createHeaders = (keys, parentTable) => {
  const thead = document.createElement('thead'),
    row = document.createElement('tr');

  for (const key of ['No', ...keys])
    row.append(createNodeWithTextContent('th', key));

  parentTable.appendChild(thead).append(row);
};

const createContent = (dataArray, keys, parentTable) => {
  const tbody = document.createElement('tbody');

  for (let idx = 0; idx < dataArray.length; idx++) {
    const item = dataArray[idx],
      row = document.createElement('tr');

    row.append(createNodeWithTextContent('td', idx + 1));

    for (const key of keys)
      row.append(createNodeWithTextContent('td', item[key]));

    parentTable.appendChild(tbody).append(row);
  }
};

function makeTables(serverUrl, id) {
  let oldData;

  return async function () {
    const dataArray = await getTableValue(serverUrl);

    if (dataArray === null) return;
    if (!Array.isArray(dataArray)) dataArray = [dataArray];
    if (dataArray.length === 0) return;

    const stringifiedData = JSON.stringify(dataArray);
    if (oldData === stringifiedData) return;

    oldData = stringifiedData;
    clearExistingData(id);

    const parentElement = document.getElementById(id),
      keys = Object.keys(dataArray[0]);

    createHeaders(keys, parentElement);
    createContent(dataArray, keys, parentElement);
  };
}

function createSection(parent, serverBaseUrl) {
  return function (dbTableName) {
    const section = document.createElement('section'),
      h4 = createNodeWithTextContent(
        'h4',
        `config=# select * from ${dbTableName};`
      ),
      table = document.createElement('table');

    const tableNodeId = dbTableName + '-table';
    table.id = tableNodeId;

    parent.appendChild(section).append(h4, table);

    const serverUrl = [serverBaseUrl, dbTableName].join('/');
    const callBackToUpdate = makeTables(serverUrl, tableNodeId);

    callBackToUpdate();

    return callBackToUpdate;
  };
}

function createAndUpdateTables({
  parent,
  tableNames,
  serverBaseUrl,
  interval = 500,
}) {
  const callbackArray = tableNames.map(createSection(parent, serverBaseUrl));

  setInterval(() => {
    for (const item of callbackArray) item();
  }, interval);
}

createAndUpdateTables({
  parent: document.body,
  tableNames: ['users'], // Your tables
  serverBaseUrl: 'http://127.0.0.1:5000',
  interval: 500
});
