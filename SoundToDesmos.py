import numpy as np

class Wave:

    def __init__(self, freq, amplitude):
        self.V = freq
        self.a = amplitude
        pass


class Note(Wave): 

    def __init__(self, tone, amplitude):
        super().__init__(66*2**(1/12*tone), amplitude)
        pass


class Segment:

    def __init__(self, start, duration):
        self.segs = []

        pass

    def add(self, wave: Wave):
        self.segs.append(wave)

    
    def calc():
        pass

