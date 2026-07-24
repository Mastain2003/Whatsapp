// worker/worker.js


import {
    handleOptions,
    jsonResponse
} from "./cors_helper.js";


import {
    handleLogin,
    checkAuth
} from "./auth_service.js";




export default {


    async fetch(
        request,
        env
    ) {


        const url =
            new URL(request.url);


        const path =
            url.pathname;



        // CORS

        if(request.method === "OPTIONS"){

            return handleOptions();

        }




        // Login (Public)

        if(path === "/login"){

            return handleLogin(
                request,
                env
            );

        }





        // Protected test route

        if(path === "/protected-test"){


            const authorized =
                await checkAuth(
                    request,
                    env
                );


            if(!authorized){

                return jsonResponse(
                    {
                        success:false,
                        message:"Unauthorized"
                    },
                    401
                );

            }



            return jsonResponse({

                success:true,

                message:
                "Protected route working"

            });


        }






        // Health check

        if(path === "/"){


            return jsonResponse({

                success:true,

                message:
                "WhatsApp API running"

            });


        }





        return jsonResponse(

            {
                success:false,
                message:"Route not found"
            },

            404

        );


    }


};
