from dallinger.nodes import Source
from dallinger.networks import Empty
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast
from sqlalchemy import Integer
import json

class BanditParamsSource(Source):

    __mapper_args__ = {"polymorphic_identity": "bandit_params_source"}

    def __init__(self, task_id, network, participant=None):
        """Endow the source with some persistent properties."""
        super(BanditParamsSource, self).__init__(network=network, participant=participant)
        self.task_id = task_id

    @hybrid_property
    def task_id(self):
        """Make property1 condition."""
        return int(self.property1)

    @task_id.setter
    def task_id(self, condition):
        """Make condition settable."""
        self.property1 = repr(condition)

    @task_id.expression
    def task_id(self):
        """Make condition queryable."""
        return cast(self.property1, Integer)

    def _contents(self):
        """Return the relevant task parameters"""
        print(f'retrieving task id {self.task_id}')
        with open("static/stimuli/bandit_params.json", "r") as f:
            params = json.load(f)
            return json.dumps(params[self.task_id])


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
