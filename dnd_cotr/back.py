class ActiveCharInfo:

    def __init__(self, obj: dict):
        self.hp = obj["hp"]
        self.mhp = obj["mhp"]
        self.m = obj["finals"]["mastery"]
        self.str = obj["finals"]["mods"]["Str"]
        self.dex = obj["finals"]["mods"]["Dex"]
        self.con = obj["finals"]["mods"]["Con"]
        self.int = obj["finals"]["mods"]["Int"]
        self.wis = obj["finals"]["mods"]["Wis"]
        self.cha = obj["finals"]["mods"]["Cha"]