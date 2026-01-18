const tools=require("./tools");
exports.run = async ({plan}) => {
  const out=[];
  for(const step of plan){
    if(!tools[step.tool]) throw new Error("NO_TOOL");
    out.push(await tools[step.tool](step.args||{}));
  }
  return out;
};
