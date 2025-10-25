// MapReduce: Extreme temperature records

var db = db.getSiblingDB('climate_db');

print("\n" + "=".repeat(60));
print("MapReduce #4: Extreme Temperature Records");
print("=".repeat(60) + "\n");

// Map function
var mapFunction = function() {
    if (this.AverageTemperature && this.Country && this.dt) {
        emit(this.Country, {
            maxTemp: parseFloat(this.AverageTemperature),
            minTemp: parseFloat(this.AverageTemperature),
            maxDate: this.dt,
            minDate: this.dt,
            recordCount: 1
        });
    }
};

// Reduce function
var reduceFunction = function(key, values) {
    var result = {
        maxTemp: -Infinity,
        minTemp: Infinity,
        maxDate: "",
        minDate: "",
        recordCount: 0
    };
    
    values.forEach(function(value) {
        if (value.maxTemp > result.maxTemp) {
            result.maxTemp = value.maxTemp;
            result.maxDate = value.maxDate;
        }
        if (value.minTemp < result.minTemp) {
            result.minTemp = value.minTemp;
            result.minDate = value.minDate;
        }
        result.recordCount += value.recordCount;
    });
    
    return result;
};

// Finalize function
var finalizeFunction = function(key, reducedValue) {
    reducedValue.tempRange = reducedValue.maxTemp - reducedValue.minTemp;
    return reducedValue;
};

// Run MapReduce
db.country_temps.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "extreme_temps",
        finalize: finalizeFunction
    }
);

print("✓ MapReduce completed");
print("Results saved in collection: extreme_temps");
print("Total countries: " + db.extreme_temps.countDocuments());

print("\nTop 5 hottest records:");
db.extreme_temps.find().sort({"value.maxTemp": -1}).limit(5).forEach(function(doc) {
    print("  " + doc._id + ": " + doc.value.maxTemp.toFixed(2) + "°C on " + doc.value.maxDate);
});

print("\nTop 5 coldest records:");
db.extreme_temps.find().sort({"value.minTemp": 1}).limit(5).forEach(function(doc) {
    print("  " + doc._id + ": " + doc.value.minTemp.toFixed(2) + "°C on " + doc.value.minDate);
});

print("\nLargest temperature ranges:");
db.extreme_temps.find().sort({"value.tempRange": -1}).limit(5).forEach(function(doc) {
    print("  " + doc._id + ": " + doc.value.tempRange.toFixed(2) + "°C range");
});
