"""Bartlett's transmission chain experiment from Remembering (1932)."""
from dallinger.config import get_config
from dallinger.experiments import Experiment
from dallinger.networks import Empty
from itertools import product
try:
    from .bots import Bot
    Bot = Bot
except ImportError:
    pass


def extra_parameters():
    config = get_config()
    types = {
        'num_participants': int
    }

    for key in types:
        config.register(key, types[key])


class SSL(Experiment):
    """Define the structure of the experiment."""
    num_participants = 1

    def __init__(self, session=None):
        """Call the same parent constructor, then call setup() if we have a session.
        """
        super(SSL, self).__init__(session)

        from . import models
        self.models = models
        self.set_conditions()

        if session:
            self.setup()

    def configure(self):
        config = get_config()
        super(SSL, self).configure()
        self.experiment_repeats = 1
        self.num_participants = config.get('num_participants', 1)

    def set_conditions(self):
        """Define the conditions"""
        n_bandit_tasks = list(range(3))
        population_sizes = [10, 30, 100]
        self.conditions = [{"task": x[0], "pop_size": x[1]} for x in product(n_bandit_tasks, population_sizes)]

    def create_network(self, condition):
        """Return a new network."""
        return self.models.SSLBanditNetwork(
            max_size=self.num_participants,
            condition=condition
        )

    def add_node_to_network(self, node, network):
        """Add node to the chain and receive transmissions."""
        print("adding node to network")
        network.add_node(node)
        parents = node.neighbors(direction="from")
        for parent in parents:
            print(f"transmitting from parent {parent}")
            parent.transmit()
        print("receiving information")
        node.receive()

    def setup(self):
        """Create the networks if there are none, adding the relevant sources to each."""
        if not self.networks():
            print("creating networks")
            for condition in self.conditions:
                print(f"creating network for condition {condition}")
                network = self.create_network(condition=condition)
                self.models.BanditParamsSource(
                    network=network,
                    cond_num=condition["task"]
                )
                self.session.add(network)
            self.session.commit()

    def recruit(self):
        """Recruit one participant at a time until all networks are full."""
        if self.networks(full=False):
            self.recruiter.recruit(n=1)
        else:
            self.recruiter.close_recruitment()