async function healthCheck() {
    return {
      body: JSON.stringify({status: "ok"})
      ,
      statusCode: 200,
    };
  }
  
  module.exports = {healthCheck};
