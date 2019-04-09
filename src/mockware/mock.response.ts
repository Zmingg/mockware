import * as Mock from 'mockjs';
import {RULES} from './rules';

const RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 1
}

function mockImplement(property, key) {
  const type = property.type;
  let result;
  
  for (let rule of Object.keys(RULES)) {
    if (new RegExp(rule, 'i').test(key.toLowerCase())) {
      result = Mock.mock(RULES[rule]);

      if (typeof result === 'string' && type === 'integer') {
        result = parseInt(result);
      }

      break;
    }
  }

  if (result === undefined) {
    switch (type) {
      case 'string':
        result = Mock.mock('@ctitle');
        break;
      case 'integer':
        result = Mock.mock('@natural(0,100)');
        break;
      case 'boolean':
        result = Mock.mock('@boolean');
        break;
      default:
        result = '';
    }
  }

  return result;
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

function mockResponse(apiResponse, key = '') {

  if (apiResponse.hasOwnProperty('allOf')) {
    let properties: any;
    apiResponse.allOf.forEach(obj => {
      properties = {...properties, ...obj.properties}
    })
    
    return mockObj({properties}, key);
  }

  if (apiResponse.hasOwnProperty('properties')) {
    return mockObj(apiResponse, key);
  }

  if (apiResponse.hasOwnProperty('items')) {
    return mockArr(apiResponse, key);
  }

  return mockImplement(apiResponse, key);
}

export function mockHandle(schema, key = '') {
  let result = mockResponse(schema);
  
  if (result.hasOwnProperty('code') && result.hasOwnProperty('data')) {
    result = result.data;
  }

  return {
    code: result === false ? RESPONSE_CODE.ERROR : RESPONSE_CODE.SUCCESS, 
    data: result, 
    msg: schema.description, 
    serverTime: new Date().getTime()
  }
}