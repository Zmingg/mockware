import * as Mock from 'mockjs';

const Random = Mock.Random;
const STRING_RULES = {
  name: '^.*name$',
  organization: '^.*organization.*$',
  time: '^.*time$',
};

function mockImplement(property, key) {
  const type = property.type;
  
  if (type === 'string') {
    let typeRule;
    Object.keys(STRING_RULES).forEach(rule => {
      if (new RegExp(STRING_RULES[rule]).test(key.toLowerCase())) {
        typeRule = rule;
      }
    })

    switch (typeRule) {
      case 'name':
        return Random.cname();
      case 'organization':
        return Random.city() + Random.ctitle() + '机构';
      case 'time': 
        return Random.datetime()
      default:
        return Random.ctitle();
    }
  }

  if (type === 'integer') {
    const {format} = property;

    if (format === 'int32') {
      return Random.integer(0, 99999999);
    }

    return Random.integer(0);
  }

  return '';
}

function mockArr(obj, key) {
  const items = obj.items;
  const count = Math.ceil(Math.random() * 10);
  const result = [];

  for (let i = 0; i <= count; i++) {
    result.push(mockResponse(items, key))
  }

  return result;
}

function mockObj(obj, key) {
  const properties = obj.properties;
  const result = {};

  Object.keys(properties).forEach(key => {
    const property = properties[key];
    result[key] = mockResponse(property, key);
  });

  return result;
}

export function mockResponse(apiResponse, key = '') {
  const type = apiResponse.type;
  let result;

  if (type === 'object') {
    result = mockObj(apiResponse, key)
  } else if (type === 'array') {
    result = mockArr(apiResponse, key);
  } else {
    result = mockImplement(apiResponse, key);
  }

  return result;

}
