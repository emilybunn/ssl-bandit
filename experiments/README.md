# cocolab

We want to study selective social learning in the context of bandit tasks.

This is an example Dallinger experiment. You can run or test it after
[installing Dallinger](https://dallinger.readthedocs.io/en/latest/installing_dallinger_for_users.html)
or using a
[Vagrant virtual machine](https://dallinger.readthedocs.io/en/latest/vagrant_setup.html).
This experiment contains a `Vagrantfile` which will setup a Linux virtual machine
with Dallinger installed for testing and running this experiment.

You can import and run it from a python prompt or script:

    from dallinger.experiments import cocolab
    exp = cocolab()
    exp.run(mode=u'debug', vebose=True)

You can also run the experiment from the experiment directory using the
dallinger command line:

    dallinger debug
