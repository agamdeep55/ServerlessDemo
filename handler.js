'use strict';
const {response} = require('./response')
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const {uuid} = require("uuidv4")

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};


module.exports.createStudent = async (event) => {
  const reqBody = JSON.parse(event.body);
  const timestamp = new Date().getTime();
  console.log(event.body)
  const isDisabled = false
  const params = {
    TableName: "StudentTable",
    Item: {
      id: uuid(),
      isDisabled: isDisabled,
      name: reqBody.name || "",
      emailId: reqBody.emailId || "",
      phone: reqBody.phone || "",
      standard: reqBody.standard || "",
      createdat: timestamp || "",
    },
  };

  const result = {
    status: 'success',
    params,
  };

  return dynamoDb.put(params).promise()
  	.then(() => response(201,result))
  	.catch(err => response(err.statusCode,err));

};

module.exports.getStudentById = async (event) => {
  try {
    const { id } = event.pathParameters;
    const params = {
      TableName: "StudentTable",
      Key:{
          id: id,
      },
    };

    return dynamoDb.get(params).promise()
  	.then((res) => response(200,res))
  	.catch(err => response(err.statusCode,err));
  } catch (err) {
    console.log(err);
    return response(400, { message: "Error Occured !" });
  }
};

module.exports.getAllStudents = async (event, context) => {
  const result = await dynamoDb.scan({TableName: "StudentTable"}).promise();
    return response(200,result.Items)
}


module.exports.deleteStudent = async (event) => {
  const reqBody = JSON.parse(event.body);

  const params = {
    Key: {
      id: reqBody.id
    },
    TableName: "StudentTable"
  };

  const result = await dynamoDb.get(params).promise();
  if(result.Item){
       return dynamoDb.delete(params).promise()
      .then(() => response(200, { message: 'Student deleted successfully'}))
      .catch((err) => response(200, err));
    }
  
  return response(200, { message: 'Does not exist'})
};

// //API function to update an item in the table
// module.exports.updateStudent = async (event, context, callback) => {

//   const ExpressionAttributeValues = {
//        ":isDisabled": true,
//    };

//   const UpdateExpression =
//     `SET ` +
//     `isDisabled=:isDisabled`;

//   const ExpressionAttributeNames = {
//      "#isDisabled":"isDisabled" ,
//    };

//    const { id } = event.pathParameters;
//   const params = {
//     TableName:"StudentTable",
//     Key:{
//         id: id,
//     },
//     UpdateExpression,
//     ConditionExpression: "attribute_exists(id)",
//     ExpressionAttributeValues,
//     ExpressionAttributeNames,
//     ReturnValues:"UPDATED_NEW"
// };

//     return dynamoDb.update(params).promise()
//       .then(() => response(200, { message: 'Student updated successfully'}))
//       .catch((err) => response(400, err));

// };

module.exports.updateStudent = async (event) => {
  const reqBody = JSON.parse(event.body);
  const timestamp = new Date().getTime();
  const { name, emailId, phone, standard, isDisabled } = reqBody

  const ExpressionAttributeValues = {
    ...(name && { ":name": name }),
    ...(emailId && { ":emailId": emailId }),
    ...(phone && { ":phone": phone }),
    ...(standard && { ":standard": standard }),
    ...(isDisabled && { ":isDisabled": isDisabled }),
       ":updatedat": timestamp,
   };

  const UpdateExpression =
    `SET ` +
    `${name ? "#name=:name," : ""}` +
    `${emailId ? "#emailId=:emailId," : ""}` +
    `${phone ? "#phone=:phone," : ""}` +
    `${standard ? "#standard=:standard," : ""}` +
    `${isDisabled ? "#isDisabled=:isDisabled," : ""}` +
    `updatedat=:updatedat`;

  const ExpressionAttributeNames = {
    ...(name && { "#name":"name" }),
    ...(emailId && { "#emailId":"emailId" }),
    ...(phone && { "#phone":"phone" }),
    ...(standard && { "#standard":"standard" }),
    ...(isDisabled && { "#isDisabled":"isDisabled" })
   };

  const id = event.pathParameters?.id

  const data = {
    TableName: "StudentTable",
    Key:{
          id: id,
    },
    UpdateExpression,
    ConditionExpression: "attribute_exists(id)",
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    ReturnValues:"UPDATED_NEW"
};

    return dynamoDb.update(data).promise()
      .then(() => response(200, { message: 'User updated successfully'}))
      .catch((err) => response(400, err));
  
};