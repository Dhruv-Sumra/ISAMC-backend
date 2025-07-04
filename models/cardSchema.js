import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const featuredEventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  location: { type: String, required: true },  
  title: { type: String, required: true },  
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const memberBenfitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const partnersSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const latestNewsSchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const leadershipSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  post: { type: String, required: true },
  expertise: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const memberTierSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeline:{type:String , required: true},
  fees:{type:Number , required:true}
});
const testimonialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const upcomingEventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  location: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});
const pastEventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  location: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const featuredPublicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const resourcesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

export const Mission = mongoose.model("Mission", missionSchema);
export const FeaturedEvent = mongoose.model("FeaturedEvent", featuredEventSchema);
export const MemberBenfit = mongoose.model("MemberBenefitSchema", memberBenfitSchema);
export const Publication = mongoose.model("Publication", publicationSchema);
export const Partners = mongoose.model("Partners", partnersSchema);
export const Leadership = mongoose.model("Leadership", leadershipSchema);
export const MemberTier = mongoose.model("MemberTier", memberTierSchema);
export const LatestNews = mongoose.model("LatestNews", latestNewsSchema);
export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export const UpcomingEvent = mongoose.model("UpcomingEvent", upcomingEventSchema);
export const PastEvent = mongoose.model("PastEvent", pastEventSchema);
export const ResourcesSchema = mongoose.model("ResourcesSchema", resourcesSchema);
export const FeaturedPublicationSchema = mongoose.model("FeaturedPublicationSchema", featuredPublicationSchema);
