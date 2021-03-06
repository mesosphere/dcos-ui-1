import Util from './Util';

const RESOURCE_KEYS = ['cpus', 'disk', 'mem'];

function setIsStartedByMarathonFlag(name, tasks) {
  return tasks.map(function (task) {
    return Object.assign({isStartedByMarathon: name === 'marathon'}, task);
  });
}

const MesosStateUtil = {

  flagMarathonTasks(state) {
    let newState = Object.assign({}, state);

    newState.frameworks = state.frameworks.map(function (framework) {
      let {tasks = [], completed_tasks = [], name} = framework;

      return Object.assign({}, framework, {
        tasks: setIsStartedByMarathonFlag(name, tasks),
        completed_tasks: setIsStartedByMarathonFlag(name, completed_tasks)
      });
    });

    return newState;
  },

  /**
   * @param {{frameworks:array,completed_frameworks:array}} state
   * @param {string} frameworkID
   * @returns {{executors:Array, completed_executors:Array}|null} framework
   */
  getFramework(state, frameworkID) {
    const {frameworks, completed_frameworks} = state;
    return [].concat(frameworks, completed_frameworks).find(
      function (framework) {
        return framework != null && framework.id === frameworkID;
      });
  },

  /**
   * @param  {Object} state A document of mesos state
   * @param  {Array} filter Allows us to filter by framework id
   *   All other frameworks will be put into an 'other' category
   * @returns {Object} A map of frameworks running on host
   */
  getHostResourcesByFramework(state, filter = []) {
    return state.frameworks.reduce(function (memo, framework) {
      framework.tasks.forEach(function (task) {
        if (memo[task.slave_id] == null) {
          memo[task.slave_id] = {};
        }

        var frameworkKey = task.framework_id;
        if (filter.includes(framework.id)) {
          frameworkKey = 'other';
        }

        let resources = task.resources;
        if (memo[task.slave_id][frameworkKey] == null) {
          memo[task.slave_id][frameworkKey] = resources;
        } else {
          // Aggregates used resources from each executor
          RESOURCE_KEYS.forEach(function (key) {
            memo[task.slave_id][frameworkKey][key] += resources[key];
          });
        }
      });

      return memo;
    }, {});
  },

  getTasksFromVirtualNetworkName(state = {}, overlayName) {
    let frameworks = state.frameworks || [];
    return frameworks.reduce(function (memo, framework) {
      let tasks = framework.tasks || [];

      return memo.concat(tasks.filter(function (task) {
        let appPath = 'container.network_infos.0.name';
        let podPath = 'statuses.0.container_status.network_infos.0.name';

        return Util.findNestedPropertyInObject(task, appPath) === overlayName
            || Util.findNestedPropertyInObject(task, podPath) === overlayName;
      }));
    }, []);
  },

  /**
   * @param {{frameworks:array, completed_frameworks:array}} state
   * @param {{id:string, executor_id:string, framework_id:string}} task
   * @param {string} path
   * @returns {string} task path
   */
  getTaskPath(state, task, path = '') {
    let taskPath = '';

    if (state == null || task == null) {
      return taskPath;
    }

    const {id:taskID, framework_id:frameworkID, executor_id:executorID} = task;
    const framework =
        MesosStateUtil.getFramework(state, frameworkID);

    if (framework == null) {
      return taskPath;
    }

    // Find matching executor or task to construct the task path
    [].concat(framework.executors, framework.completed_executors)
        .every(function (executor) {
          // Find app/framework executor
          if (executor != null &&
              (executor.id === executorID || executor.id === taskID)) {
            taskPath = `${executor.directory}/${path}`;
            return false;
          }

          // Find pod task and executor
          return [].concat(executor.tasks, executor.completed_tasks)
            .every(function (task) {
              if (task != null && task.id === taskID) {
                // For a detail documentation on how to construct the path
                // please see: https://reviews.apache.org/r/52376/
                taskPath =
                    `${executor.directory}/tasks/${task.id}/${path}`;
                return false;
              }

              return true;
            });
        });

    return taskPath;
  }
};

module.exports = MesosStateUtil;
