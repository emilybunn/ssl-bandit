from dallinger.nodes import Source
from dallinger.networks import Empty
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast
from sqlalchemy import Integer
import json

class BanditParamsSource(Source):

    __mapper_args__ = {"polymorphic_identity": "bandit_params_source"}

    def __init__(self, cond_num, network, participant=None):
        """Endow the source with some persistent properties."""
        super(BanditParamsSource, self).__init__(network=network, participant=participant)
        self.cond_num = cond_num

    @hybrid_property
    def cond_num(self):
        """Make property1 condition."""
        return int(self.property1)

    @cond_num.setter
    def cond_num(self, condition):
        """Make condition settable."""
        self.property1 = repr(condition)

    @cond_num.expression
    def cond_num(self):
        """Make condition queryable."""
        return cast(self.property1, Integer)

    def _contents(self):
        """Return the relevant task parameters"""
        print(f'retrieving task id {self.cond_num}')
        with open("static/stimuli/bandit_params.json", "r") as f:
            params = json.load(f)
        with open(f"static/stimuli/teacher_data_{self.cond_num}.json", "r") as f:
        # with open(f"static/stimuli/teacher_data.json", "r") as f:
            teacher_data = json.load(f)
        return json.dumps({"params": params, "teacher_data": teacher_data})
    

class SSLBanditNetwork(Empty):

    __mapper_args__ = {"polymorphic_identity": "ssl_bandit_network"}

    def __init__(
        self,
        max_size,
        condition,
    ):
        """Endow the network with some persistent properties."""
        super(SSLBanditNetwork, self).__init__(max_size=max_size)
        self.condition = condition

    def add_node(self, node):
        sources = [n for n in self.nodes() if n.id != node.id and isinstance(n, BanditParamsSource)]

        for source in sources:
            source.connect(whom=node)