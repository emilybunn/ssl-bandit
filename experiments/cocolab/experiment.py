"""Bartlett's transmission chain experiment from Remembering (1932)."""
from dallinger.config import get_config
from dallinger.experiments import Experiment
from dallinger.networks import Empty
from
try:
    from .bots import Bot
    Bot = Bot
except ImportError:
    pass


def extra_parameters():
    config = get_config()
    types = {
        'num_participants': int,
        'all_bandit_params': dict
    }

    for key in types:
        config.register(key, types[key])


class ssl(Experiment):
    """Define the structure of the experiment."""
    num_participants = 1

    def __init__(self, session=None):
        """Call the same parent constructor, then call setup() if we have a session.
        """
        super(ssl, self).__init__(session)

        from . import models
        self.models = models

        if session:
            self.setup()

    def configure(self):
        config = get_config()
        super(ssl, self).configure()
        self.experiment_repeats = 1
        self.num_participants = config.get('num_participants', 1)

    def create_network(self):
        """Return a new network."""
        return Empty(max_size=self.num_participants)

    def setup():
        """Create the networks if there are none, adding the relevant sources to each."""
        if not self.networks():
            super(ssl, self).setup()
            for net in self.networks():
                self.models.BanditParamsSource(network=net)
            self.session.commit()
