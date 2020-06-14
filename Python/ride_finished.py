import requests

o = requests.post("http://localhost:38771/rideFinished", headers={"vehicleid": "-M9ibFAVEKjdDQIch3hB", "type": "bus", "datetime": "123", "datetimeid": "-M9ibFA_G0Ano0A4aXv_"})
print(o.content)