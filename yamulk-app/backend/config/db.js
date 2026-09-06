import mongoose from 'mongoose'

export async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGOOSEURI)
        console.log("Database Connected")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
