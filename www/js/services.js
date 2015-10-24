angular.module("stocks.services",[])

.factory("encodeURIService",function(){
  return {
    encode:function(string){
      console.log(string);
      return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/!'()]/g, escape);
    }
  };
})

.factory("dateService", function($filter){
var currentDate = function(){
var d = new Date();
var date = $filter('date') (d,'yyyy-MM-dd');
return date;
};
var oneYearAgoDate = function(){
  var d = new Date(new Date().setDate(new Date().getDate()-365));
  var date = $filter('date') (d,'yyyy-MM-dd');
  return date;

};

return {
  currentDate:currentDate,
  oneYearAgoDate:oneYearAgoDate
};
})
.factory("stockDataService",["$q","$http","encodeURIService",function($q,$http,encodeURIService){
  var getDetailsData = function(ticker){
    var deferred = $q.defer();
    var query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")';
    var url ='http://query.yahooapis.com/v1/public/yql?q='+encodeURIService.encode(query)+'&format=json&env=http://datatables.org/alltables.env';
    console.log(url);
    $http.get(url)
      .success(function(json){
        var jsonData= json.query.results.quote;
        deferred.resolve(jsonData);
      })
      .error(function(error){
        console.log("Details data error: "+ error);
        deferred.reject();
      });
      return deferred.promise;


  };
  var getPriceData = function(ticker){
    var deferred = $q.defer();
    var url = "http://finance.yahoo.com/webservice/v1/symbols/"+ticker+"/quote?format=json&view=detail";
  $http.get(url)
    .success(function(json){
      var jsonData= json.list.resources[0].resource.fields;
      deferred.resolve(jsonData);
    })
    .error(function(error){
      console.log("Price data error: "+ error);
      deferred.reject();
    });
    return deferred.promise;
  };
    return {
      getPriceData: getPriceData,
      getDetailsData: getDetailsData
    };
}])
.factory('chartDataService',['$q','$http','encodeURIService',function($q,$http,encodeURIService){

  var getHistoricalData = function(ticker, fromDate, todayDate){
  var deferred = $q.defer();
  var query = 'select * from yahoo.finance.historicaldata where symbol = "'+ticker+'" and startDate = "'+ fromDate +'" and endDate = "'+todayDate+'2010-03-10"';
  var url ='http://query.yahooapis.com/v1/public/yql?q='+encodeURIService.encode(query)+'&format=json&env=http://datatables.org/alltables.env';
  $http.get(url)
  .success(function(json){
    var jsonData = json.query.results.quote;
    var priceData = [];
    var volumeData = [];

    jsonData.forEach(function(dayDataObject){
      var dateToMillis = dayDataObject.Date;
      var date = Date.parse(dateToMillis);
      var price = parseFloat(Math.round(dayDataObject.Close*100)/100).toFixed(3);
      var volume = dayDataObject.Volume;
      var volumeDatum = '['+ date + ',' + volume + ']';
      var priceDatum = '['+ date + ',' + volume + ']';

      volumeData.unshift(volumeDatum);
      priceData.unshift(priceDatum);
      //console.log(dayDataObject);
    //  console.log(volumeDatum);
    //  console.log(priceDatum);
    });

    var formattedChartData =
    '[{'+
     '"key":' + '"volume",'+
     '"bar":' + 'true,' +
     '"values":' + '['+ volumeData + ']'+
     '},'+
     '{' +
     '"key":'+ '"'+ ticker +'",' +
     '"values":' + '['+ priceData + ']'+
     '}]';

    deferred.resolve(formattedChartData);
  })
  .error(function(error){
    console.log("Chart data error: "+error);
    deferred.reject();
  });
  return deferred.promise;
  };
  return {
    getHistoricalData:getHistoricalData
  };
}])

;
