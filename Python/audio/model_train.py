import librosa
import numpy as np
import sys
import os
import matplotlib.pyplot as plt
import librosa.display
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D
import pandas as pd
import warnings
from tqdm import tqdm
import keras
import soundfile as sf
from sklearn.model_selection import train_test_split
warnings.filterwarnings('ignore')

width = 16

def transform_event(event_y, event_sr, samples):
    spectogram = librosa.feature.melspectrogram(y=event_y, sr=event_sr, n_mels=64, n_fft=samples, hop_length=int(samples/width))
    S_db = librosa.power_to_db(spectogram, ref=np.max)[:, :width]
    #S_db = librosa.decompose.nn_filter(S_db, aggregate=np.median, metric='cosine')
    return np.pad(S_db, ((0, 0), (0, width-S_db.shape[1])), 'constant')

def frame_audio(audio, sr):
    frames = librosa.time_to_frames([0, 0.25], sr=sr, hop_length=1)
    return np.array([audio[i:i+frames[1]] for i in range(0, len(audio), frames[1])]), frames[1]


def add_data(folder, y_val):
    x = []
    y = []
    for filename in tqdm(os.listdir(folder)[:200]):
        ys, sr = librosa.load(folder + "/" + filename)
        frames, samples = frame_audio(ys, sr)
        for frame in frames:
            S = transform_event(frame, sr, samples)
            if librosa.feature.rms(S=S, frame_length=126).mean() < 2:
                continue
            # librosa.display.specshow(S)
            # plt.show(block=True)
            # sf.write("test.wav", frame, sr)
            # sys.exit(0)
            x.append(S.tolist())
            y.append(y_val)
    return x, y

if __name__ == "__main__":
    x_train, y_train = add_data("coughs", 0)
    out = add_data("non_coughs", 1)
    x_train += out[0]
    y_train += out[1]

    print(len(x_train), len(x_train[0]), len(x_train[0][0]))
    print(np.array(x_train).shape)

    X_train, X_test, Y_train, Y_test = train_test_split(x_train, y_train, test_size=0.33, random_state=42)
    X_train = np.array(X_train).reshape((len(X_train), 64, width, 1))
    Y_train = np.array(Y_train)
    X_test = np.array(X_test).reshape((len(X_test), 64, width, 1))
    Y_test = np.array(Y_test)

    print(X_train.shape)
    print(Y_train.shape)

    model = Sequential()
    model.add(Conv2D(16, (9, 3), activation='relu', strides=1, input_shape=(64, width, 1)))
    model.add(MaxPooling2D((2, 1), strides=1))
    model.add(Conv2D(16, (5, 3), activation='relu', strides=1))
    model.add(MaxPooling2D((2, 1), strides=1))
    model.add(Flatten())
    model.add(Dense(256, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(256, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(1, activation='sigmoid'))

    model.compile(loss=keras.losses.binary_crossentropy, optimizer=keras.optimizers.Adadelta(), metrics=['accuracy'])

    print(X_train.shape)
    print(Y_train.shape)
    model.fit(X_train, Y_train, batch_size=128, epochs=30, verbose=1)
    print(model.evaluate(X_test, Y_test))
    model.save("audio_model4")