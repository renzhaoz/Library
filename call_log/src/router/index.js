/**
 * @file - Register Communnications Router
 * @return { Objcet } - routerConfig
 * @example {
 *  routerConfig: {
 *    ComponentName: {
 *      viewName,
 *      component,
 *      dis
 *    }
 *  }
 * }
*/

import React from 'react';
import loadable from 'react-loadable';

const Loading = () => (
  <div></div>
);

const CallView = loadable({
  loader: () => import('views/calllogList/calllog_view'),
  loading: Loading,
});

const ListInfoView = loadable({
  loader: () => import('views/calllogInfor/calllog_info_view'),
  loading: Loading,
});

const routerConfig = {
  listView: {
    name: 'listView',
    component: CallView,
    dis: 'Communications main view!'
  },
  listInfoView: {
    name: 'listInfoView',
    component: ListInfoView,
    dis: 'Communications item detail view!'
  }
}

export default routerConfig;
