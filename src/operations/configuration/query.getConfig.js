import {userPool} from "../../db/index.js";
import LOG from "../../utils/Log.js";
import HandleResolverError from '../../utils/SessionValidation.js';

const getConfig = async (root, params, { session }) => {
  let query = {};
  if (params.user) {
    if (params.user === '**generic_user**') {
      throw 'Cannot use this username';
    }
    query = {
      text: 'SELECT configuration FROM user_config WHERE username=$1 AND tenant=$2;',
      values: [params.user, params.tenant],
    };
  } else {
    query = {
      text: 'SELECT configuration FROM user_config WHERE username=$1 AND tenant=$2;',
      values: ['**generic_user**', params.tenant],
    };
  }

  try {
    const result = await userPool.query(query);
    if (result.rowCount) {
      return (JSON.stringify(result.rows[0].configuration));
    }

    LOG.info(`Could not retrieve configuration from user ${params.user} in tenant ${params.tenant}`);
    return null;
  } catch (error) {
    HandleResolverError(session, error);
    throw error;
  }
}

export default getConfig;
