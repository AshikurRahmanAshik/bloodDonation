# bloodDonation-api
 
The main objective of this project is to find the nearest blood donor quickly using a
real time map.In our Map Based Blood Collection System people can search for a donor
without signing up. Being a guest user anyone can search for blood in an emergency.
But for being a donor anyone has to sign up first.


##For sign up
[https://api-blood-donation.herokuapp.com/api/user/signup](https://api-blood-donation.herokuapp.com/api/user/signup)
 

###Parameters
- Name
- Mobile Number
- Blood Group
- Location(latitude, longitude)
- Password
- Confirm Password

+ Response 200 (application/json)
 
    
        {
            "name": "Ashik",
            "phone": "01723732072",
            "bloodGroup": "O+",
            "point":[18, 90],
            "password": "111111",
            "confirmPassword": "111111"
        }
 

##For sign in
[https://api-blood-donation.herokuapp.com/api/user/login](https://api-blood-donation.herokuapp.com/api/user/login)

###Parameters
- Mobile Number
- Password

+ Response 200 (application/json)
 
    
        {
            "phone": "01723732072",
            "password": "111111",
        }

##Search blood doners
[https://api-blood-donation.herokuapp.com/api/user?lat=18&lon=90&distance=5000&bloodGroup=O%2d](https://api-blood-donation.herokuapp.com/api/user?lat=18&lon=90&distance=5000&bloodGroup=O%2d)

###here ,
- we give the input distance in Kilometer unit.
- for searching positive bloodGroup,we use bloodgroup=bloodgroup_name%2b 
- for example searching o+ ,we write bloodGroup=O%2b
- for searching positive bloodGroup,we use bloodgroup=bloodgroup_name%2d
- for example searching o- ,we write bloodGroup=O%2d


+ Response 200 (application/json)
 
    
        {
            "staus": "success",
            "user": [
                {
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            18,
                            90
                        ]
                    },
                    "_id": "62487fe606b26e63b1a6ceb5",
                    "name": "Ashik",
                    "phone": "01723732072",
                    "bloodGroup": "O+"
                }
            ]
        }


##Update blood donor information
[https://api-blood-donation.herokuapp.com/api/user/update](https://api-blood-donation.herokuapp.com/api/user/update)

###here,
- send token with header
- can’t update password phone number in this route

###Changeable Parameters
- Name
- Blood Group
- Location


+ Response 200 (application/json)
 
    
        {
            "name": "emon",
            "bloodGroup": "B+",
            "point":[-18, 90]
        }


##To see a specific blood donor information
[https://api-blood-donation.herokuapp.com/api/user/pass user id in here](https://api-blood-donation.herokuapp.com/api/user/pass)

###here , 
- we use id(specific_blood_donor) in place of pass 

+ Response 200 (application/json)
 
    
        {
            "staus": "success",
            "user": {
                {
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            18,
                            90
                        ]
                    },
                    "_id": "62487fe606b26e63b1a6ceb5",
                    "name": "Ashik",
                    "phone": "01723732072",
                    "bloodGroup": "O+"
                }
            }
        }
