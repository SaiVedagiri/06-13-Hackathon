from model_train import *
import pyaudio
import time
import requests
from tensorflow.keras.models import load_model

VEHICLEID = "-M9ibFAVEKjdDQIch3hB"
TIMEID = "-M9ibFA_G0Ano0A4aXv_"
TYPE = "bus"
ENDPOINT = "http://localhost:39113/coughIncrement"

FILE = ""
noise_floor = 3
confidence_interval = 0.5

model = load_model("audio_model3")
last_5 = []

def send_post():
    #time = datetime.now().isoformat()
    time = 8.5
    try:
        retr = requests.post(ENDPOINT, headers={"type": TYPE, "origin": "*", "vehicleid": VEHICLEID, "timeid": TIMEID, "time": str(time)})
    except:
        return
    print(retr.content)

def callback(in_data, frame_count, time_info, flag):
    global last_5
    x = []
    audio_data = np.fromstring(in_data, dtype=np.float32)
    #print("Audio", len(audio_data))
    S = transform_event(audio_data, 44100, int(44100*0.25))
    if librosa.feature.rms(S=S, frame_length=126).mean() < 2:
        return (None, pyaudio.paContinue)
    x.append(S.tolist())
    if len(x) == 0:
        return (None, pyaudio.paContinue)
    librosa.display.specshow(np.array(x[0]))
    plt.draw()
    plt.pause(0.0001)
    plt.clf()
    x = np.array(x).reshape((len(x), 64, 16, 1))
    conf = 1 - model.predict(np.array(x))[0][0]
    last_5.append(conf)
    if len(last_5) > 5:
        last_5 = last_5[1:]
    print(sum(last_5)/len(last_5))
    if sum(last_5)/len(last_5) > confidence_interval and len(last_5) > 4:
        last_5 = []
        print("Cough")
        send_post()
    return (None, pyaudio.paContinue)

if not FILE:
    print("Mic")
    p = pyaudio.PyAudio()

    for x in range(0, p.get_device_count()):
        info = p.get_device_info_by_index(x)
        print(info)

    stream = p.open(format=pyaudio.paFloat32,
        channels=1,
        rate=44100,
        input=True,
        output=False,
        frames_per_buffer=int(44100*0.5),
        stream_callback=callback,
        input_device_index=6)

    stream.start_stream()

    while stream.is_active():
        time.sleep(0.1)
else:
    audio, sr = librosa.load(FILE)
    callback(audio, 0, 0, 0)