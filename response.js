const response = (statusCode, message) => {
  return {
    statusCode: statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(message)
  };
}

module.exports = {
  response
}